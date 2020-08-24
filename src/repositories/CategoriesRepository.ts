import { EntityRepository, Repository } from 'typeorm';

// import AppError from '../errors/AppError';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
	public async checkMaybeCreateCategory(category: string): Promise<Category> {
		const categoryExists = await this.findOne({
			where: { title: category },
		});
		if (!categoryExists || categoryExists === undefined) {
			const newCategory = this.create({
				title: category,
			});

			await this.save(newCategory);

			return newCategory;
		}

		return categoryExists;
	}
}

export default CategoriesRepository;
