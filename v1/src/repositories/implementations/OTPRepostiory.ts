import { IOtp } from "../../entities/IOtp";
import { IOTPRepository } from "../../repositories/interface/IOTPRepository";
import { Otp } from "../../schemas/otpSchema";
import { BaseRepository } from "./BaseRepository";
class OTPRepository extends BaseRepository<IOtp> implements IOTPRepository {
  constructor() {
    super(Otp);
  }
}

export default new OTPRepository();
