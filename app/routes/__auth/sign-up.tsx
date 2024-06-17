import {
  Button,
  Group,
  PasswordInput,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import type { ActionFunction } from "@remix-run/node";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { createUserSession } from "~/lib/session.server";
import { createUser, getUserByEmail } from "~/lib/user.server";
import { RegisterUserSchema } from "~/lib/zod.schema";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

interface ActionData {
  fieldErrors?: inferErrors<typeof RegisterUserSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fieldErrors, fields } = await validateAction(
    request,
    RegisterUserSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phoneNo,
    address,
    city,
    state,
    dob,
    zipcode,
  } = fields;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return badRequest<ActionData>({
      fieldErrors: {
        email: "A user already exists with this email",
      },
    });
  }

  const user = await createUser({
    firstName,
    lastName,
    email,
    password,
    phoneNo,
    address,
    dob: new Date(dob),
    city,
    state,
    zipcode,
  });

  return createUserSession({
    request,
    userId: user.id,
    role: user.role,
    redirectTo: "/",
  });
};

export default function SignUp() {
  const [searchParams] = useSearchParams();

  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;

  const redirectTo = searchParams.get("redirectTo") || "/";
  const isSubmitting = fetcher.state !== "idle";

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 w-[40vw]">
      <div>
        <h1 className="mt-6 font-extrabold text-gray-900 text-center">
          Sign Up
        </h1>
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        <div className="flex flex-col items-center justify-center gap-2 w-[40%]">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto" />
          <h3>Online Grocery Store</h3>
        </div>
        <div className="w-[60%]">
          <fetcher.Form method="post" replace={true} className="mt-8">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2">
                <TextInput
                  name="firstName"
                  autoComplete="given-name"
                  label="First Name"
                  error={actionData?.fieldErrors?.firstName}
                  required={true}
                />
                <TextInput
                  name="lastName"
                  autoComplete="given-name"
                  label="Last Name"
                  error={actionData?.fieldErrors?.lastName}
                  required={true}
                />
              </div>

              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                label="Email address"
                error={actionData?.fieldErrors?.email}
                required={true}
              />

              <div className="flex items-center justify-center gap-2">
                <PasswordInput
                  name="password"
                  label="Password"
                  error={actionData?.fieldErrors?.password}
                  autoComplete="current-password"
                  required={true}
                  className="w-full"
                />
                <PasswordInput
                  name="confirmPassword"
                  label="Confirm Password"
                  error={actionData?.fieldErrors?.confirmPassword}
                  autoComplete="current-password"
                  required={true}
                  className="w-full"
                />
              </div>

              <TextInput
                name="phoneNo"
                type="tel"
                label="Phone Number"
                error={actionData?.fieldErrors?.phoneNo}
                required={true}
              />

              <Textarea
                name="address"
                label="Address"
                autoComplete="street-address"
              />

              <div className="flex items-center justify-center gap-2">
                <TextInput
                  name="city"
                  label="City"
                  error={actionData?.fieldErrors?.city}
                  required={true}
                />
                <DatePicker
                  name="dob"
                  label="Date of Birth"
                  error={actionData?.fieldErrors?.dob}
                  maxDate={new Date()}
                  required={true}
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <TextInput
                  name="state"
                  label="State"
                  error={actionData?.fieldErrors?.state}
                  required={true}
                />
                <TextInput
                  name="zipcode"
                  label="Zipcode"
                  error={actionData?.fieldErrors?.zipcode}
                  required={true}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <Group position="apart">
                  <Switch
                    id="remember-me"
                    name="rememberMe"
                    label="Remember me"
                  />
                </Group>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 underline hover:text-black"
                >
                  Sign In
                </Link>
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth={true}
                loaderPosition="right"
                mt="1rem"
              >
                Sign Up
              </Button>
            </fieldset>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
