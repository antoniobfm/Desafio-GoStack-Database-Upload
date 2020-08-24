import { getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
	title: string;
	type: 'income' | 'outcome';
	value: number;
	category: string;
}

class ImportTransactionsService {
	async execute(filePath: string): Promise<Transaction[]> {
		const transactionsRepository = getCustomRepository(TransactionsRepository);
		const categoriesRepository = getCustomRepository(CategoriesRepository);

		const csvReadStream = fs.createReadStream(filePath);

		const parsers = csvParse({ delimiter: ',', from_line: 2 });

		const parseCSV = csvReadStream.pipe(parsers);

		const transactions: RequestDTO[] = [];

		const categories: string[] = [];

		parseCSV.on('data', async line => {
			const [title, type, value, category] = line.map((cell: string) =>
				cell.trim(),
			);
			if (!title || !type || !value) return;

			categories.push(category);

			transactions.push({ title, type, value, category });
		});

		await new Promise(resolve => parseCSV.on('end', resolve));

		const existentCategories = await categoriesRepository.find({
			where: {
				title: In(categories),
			},
		});

		const existentCategoriesTitles = existentCategories.map(
			(category: Category) => category.title,
		);

		const addCategoryTitles = categories
			// Identifica quais n'ao existem
			.filter(category => !existentCategoriesTitles.includes(category))
			// Limpa duplicados
			.filter((value, index, self) => self.indexOf(value) === index);

		const newCategories = categoriesRepository.create(
			addCategoryTitles.map(title => ({
				title,
			})),
		);

		await categoriesRepository.save(newCategories);

		const finalCategories = [...newCategories, ...existentCategories];

		const createdTransactions = transactionsRepository.create(
			transactions.map(transaction => ({
				title: transaction.title,
				type: transaction.type,
				value: transaction.value,
				category: finalCategories.find(
					category => category.title === transaction.category,
				),
			})),
		);

		await transactionsRepository.save(createdTransactions);

		await fs.promises.unlink(filePath);

		return createdTransactions;
	}
}

export default ImportTransactionsService;
