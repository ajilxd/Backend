export enum SuccessType {
  Ok = "Ok", // 200
  Created = "Created", // 201
  NoContent = "NoContent", // 204
  Accepted = "Accepted", // 202
}

export const successMap = {
  [SuccessType.Ok]: {
    code: 200,
    message: "Request successful.",
  },
  [SuccessType.Created]: {
    code: 201,
    message: "Resource successfully created.",
  },
  [SuccessType.NoContent]: {
    code: 204,
    message: "Request processed successfully, no content to return.",
  },
  [SuccessType.Accepted]: {
    code: 202,
    message: "Request accepted but processing is not complete.",
  },
};
