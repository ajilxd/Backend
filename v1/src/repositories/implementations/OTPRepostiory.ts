import { Model } from "mongoose";
import { IOtp } from "../../entities/IOtp";
import { IOTPRepository } from "../../repositories/interface/IOTPRepository";
import { Otp } from "../../schemas/otpSchema";
import { BaseRepository } from "./BaseRepository";
class OTPRepository extends BaseRepository<IOtp> implements IOTPRepository {
  constructor(model: Model<IOtp>) {
    super(model);
  }
}

export default new OTPRepository(Otp);
