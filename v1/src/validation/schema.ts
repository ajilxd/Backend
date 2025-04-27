import Joi from "joi";

//owner schema
export const ownerValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  subscriptionId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Subscription ID must be a valid string.",
  }),
});

//subscription schema

export const subscriptionValidationSchema = Joi.object({
  validity: Joi.string().required().messages({
    "string.empty": "Validity is required.",
    "any.required": "Validity is required.",
  }),
  amount: Joi.string().required().messages({
    "string.empty": "Amount is required.",
    "any.required": "Amount is required.",
  }),
  spec: Joi.object({
    managerCount: Joi.string().optional().allow(null, "").messages({
      "string.base": "Manager count must be a string.",
    }),
    spacesCount: Joi.string().optional().allow(null, "").messages({
      "string.base": "Spaces count must be a string.",
    }),
  })
    .optional()
    .messages({
      "object.base": "Spec must be an object.",
    }),
  name: Joi.string().required().messages({
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
});
