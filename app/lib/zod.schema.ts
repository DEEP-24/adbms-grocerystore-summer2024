import { z } from "zod";

const firstName = z.string().min(1, "FirstName is required");
const lastName = z.string().min(1, "LastName is required");
const email = z.string().email("Invalid email");
const password = z.string().min(8, "Password must be at least 8 characters");

export const LoginSchema = z.object({
  email,
  password,
  remember: z.enum(["on"]).optional(),
  redirectTo: z.string().default("/"),
});

export const RegisterUserSchema = z
  .object({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: password,
    phoneNo: z.string().min(10, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    dob: z.string().min(1, "Date of birth is required"),
    city: z.string().min(3, "City is required"),
    state: z.string().min(2, "State is required"),
    zipcode: z.string().min(5, "Zipcode is required"),
    redirectTo: z.string().default("/"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password", "confirmPassword"],
  });

export const ManageProductSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.preprocess(
    Number,
    z.number().min(1, "Quantity must be at least 1"),
  ),
  price: z.preprocess(
    Number,
    z.number().min(0, "Price must be greater than 0"),
  ),
  image: z.string().min(1, "Image is required"),
  category: z
    .string()
    .min(1, "Category is required")
    .transform((value) => value.split(",")),
});
