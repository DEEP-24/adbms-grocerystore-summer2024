import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { db } from "~/lib/prisma.server";
import { createPasswordHash } from "~/utils/misc.server";

export async function getUserById(id: User["id"]) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      address: true,
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return db.user.findUnique({
    where: { email },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });
}

export async function createUser({
  email,
  password,
  firstName,
  lastName,
  role = Role.CUSTOMER,
  phoneNo,
  address,
  dob,
  city,
  state,
  zipcode,
}: {
  email: User["email"];
  password: string;
  firstName: User["firstName"];
  lastName: User["lastName"];
  role?: User["role"];
  phoneNo: User["phoneNo"];
  address: User["address"];
  dob: User["dob"];
  city: User["city"];
  state: User["state"];
  zipcode: User["zipcode"];
}) {
  return db.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: await createPasswordHash(password),
      role,
      phoneNo,
      address,
      dob,
      city,
      state,
      zipcode,
    },
  });
}

export async function verifyLogin(email: User["email"], password: string) {
  const userWithPassword = await db.user.findUnique({
    where: { email },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
