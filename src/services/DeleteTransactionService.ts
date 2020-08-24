import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
	public async execute(id: string): Promise<Transaction> {
		const transactionsRepository = getCustomRepository(TransactionsRepository);

		const transactionIndex = await transactionsRepository.findOne({
			where: { id },
		});

		if (!transactionIndex) {
			throw new AppError('Transaction not found');
		}

		await transactionsRepository
			.createQueryBuilder('transactions')
			.delete()
			.from(Transaction)
			.where('id = :id', { id })
			.execute();

		return transactionIndex;
	}
}

export default DeleteTransactionService;
