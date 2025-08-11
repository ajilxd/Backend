export enum SuccessType {
  Ok = "Ok",
  Created = "Created",
  NoContent = "NoContent",
  Accepted = "Accepted",
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
