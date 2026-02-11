import { body } from "express-validator";

const userRegisterValidation = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email must required")
      .isEmail()
      .withMessage("Not a Valid Email"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("must be in lowercase")
      .isLength({ min: 5 })
      .withMessage("Usernamemust must have atleast 5 character"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 5 })
      .withMessage("password must be atleast 5 character long"),
  ];
};

export { userRegisterValidation };
