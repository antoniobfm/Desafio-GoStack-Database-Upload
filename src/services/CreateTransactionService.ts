import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface RequestDTO {
	title: string;
	value: number;
	type: 'income' | 'outcome';
	category: string;
}

class CreateTransactionService {
	public async execute({
		title,
		value,
		type,
		category,
	}: RequestDTO): Promise<Transaction> {
		const transactionsRepository = getCustomRepository(TransactionsRepository);
		const categoriesRepository = getCustomRepository(CategoriesRepository);

		const balance = await transactionsRepository.getBalance();

		try {
			if (type === 'outcome' && value > balance.total) {
				throw new AppError('You dont have enough balance for this transaction');
			}
		} catch (err) {
			throw new AppError('You dont have enough balance for this transaction');
		}
		const getCategory = await categoriesRepository.checkMaybeCreateCategory(
			category,
		);

		// Cria a instancia
		const transaction = transactionsRepository.create({
			title,
			value,
			type,
			category_id: getCategory.id,
		});

		// Salva a instancia no banco de dados
		await transactionsRepository.save(transaction);

		// Retorna o appointment
		return transaction;
	}
}

export default CreateTransactionService;
