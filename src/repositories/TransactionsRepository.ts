import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
	income: number;
	outcome: number;
	total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
	public async getBalance(): Promise<Balance> {
		const AllIncome = await this.find({ where: { type: 'income' } });

		const AllOutcome = await this.find({ where: { type: 'outcome' } });

		const AllIncomeValue = AllIncome.map(elem => {
			return elem.value;
		});

		const AllOutcomeValue = AllOutcome.map(elem => {
			return elem.value;
		});

		if (AllIncomeValue.length === 0) {
			const balance = {
				income: 0,
				outcome: 0,
				total: 0,
			};

			return balance;
		}

		const getIncome = AllIncomeValue.reduce((sum, elem: number) => {
			return sum + elem;
		});

		if (AllOutcomeValue.length === 0) {
			const balance = {
				income: getIncome,
				outcome: 0,
				total: getIncome - 0,
			};

			return balance;
		}

		const getOutcome = AllOutcomeValue.reduce((sum, elem: number) => {
			return sum + elem;
		});

		const income = getIncome;

		const outcome = getOutcome;

		const total = getIncome - getOutcome;
		const balance = {
			income,
			outcome,
			total,
		};

		return balance;
	}
}

export default TransactionsRepository;
