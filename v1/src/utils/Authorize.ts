// import { Request, Response, NextFunction } from "express";
// type RequestType = Request & { user: any };
// const authorizeRole = (role: string) => {
//   return (req: any, res: Response, next: NextFunction): Promise<void> | any => {
//     console.log("req.user at authorize role", req.user);
//     if (!req.user || req.user.role !== role) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden: Insufficient permissions" });
//     }
//     next();
//   };
// };

// export default authorizeRole;
