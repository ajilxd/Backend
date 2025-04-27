import { Model, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interface/IBaserRepository";

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findAll(): Promise<T[]> {
    return await this.model.find().exec();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(email: string): Promise<T | null> {
    return await this.model.findOneAndDelete({ email }).exec();
  }

  async resetRefreshToken(id: string): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, { refreshToken: "" }, { new: true })
      .exec();
  }
}
