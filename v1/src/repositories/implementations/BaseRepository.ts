import { Model, FilterQuery, UpdateQuery, ObjectId } from "mongoose";
import { IBaseRepository } from "../interface/IBaserRepository";

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: Model<T>) {}

  create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  find(filter: FilterQuery<T>): Promise<[] | T[]> {
    return this.model.find(filter).exec();
  }

  findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(email: string): Promise<T | null> {
    return this.model.findOneAndDelete({ email }).exec();
  }
}
