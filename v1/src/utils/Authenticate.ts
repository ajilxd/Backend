// import jwt from "jsonwebtoken";
// import config from "../config";
// import { Request, Response, NextFunction } from "express";

// const checkToken = (token: string): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, config.JWT_SECRET_KEY, (err, decoded) => {
//       if (err) {
//         console.log("error at the check token", err);
//         reject(err);
//       } else {
//         console.log("verified token");
//         resolve(decoded);
//       }
//     });
//   });
// };

// const Authencticate = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   console.log("hiii there this is from the authenticator");
//   console.log(req.cookies);
//   const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
//   if (!token)
//     return res
//       .status(401)
//       .json({ status: "fail", error: "unauthorized:no token provided" });
//   try {
//     const data = await checkToken(token);
//     req.user = data;
//     next();
//   } catch (err) {
//     return res
//       .status(401)
//       .json({ status: "fail", error: "unauthorized:invalid or expired token" });
//   }
// };

// export default Authencticate;
