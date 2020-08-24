import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadCofing from '../config/multipleUploads';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadCofing);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
	// Chama o repositorio
	const transactionsRepository = getCustomRepository(TransactionsRepository);

	// Usa a funcao .find() para recuperar o repositorio
	const transactions = await transactionsRepository
		.createQueryBuilder('transactions')
		.leftJoin('transactions.category', 'category')
		.select(['transactions.id'])
		.addSelect('transactions.title')
		.addSelect('transactions.value')
		.addSelect('transactions.type')
		.addSelect('transactions.created_at')
		.addSelect('category.id')
		.addSelect('category.title')
		.addSelect('category.created_at')
		.addSelect('category.updated_at')
		.getMany();

	// Usa a funcao .getBalance() para pegar o balance do repositorio
	const balance = await transactionsRepository.getBalance();

	// Retorna o resultado
	return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
	// Captura as informacoes do body
	const { title, value, type, category } = request.body;

	// Define createAppointment chamanando o servico de criar o appointment
	const createTransaction = new CreateTransactionService();

	// Cria o appointment usando o servico e manda as variaveis
	const transaction = await createTransaction.execute({
		title,
		value,
		type,
		category,
	});

	// Executa o codigo acima e retorna o JSON
	return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
	const { id } = request.params;

	const deleteTransaction = new DeleteTransactionService();

	const transaction = await deleteTransaction.execute(id);

	return response.json(transaction);
});

transactionsRouter.post(
	'/import',
	upload.array('file'),
	async (request, response) => {
		const importTransactions = new ImportTransactionsService();

		const { files } = request;

		const transactionsGrouped: any[] = [];

		for await (const file of files) {
			const transactions = await importTransactions.execute(file.path);
			transactionsGrouped.push(transactions);
		}
		console.log(transactionsGrouped);
		return response.json(transactionsGrouped);
	},
);

export default transactionsRouter;
