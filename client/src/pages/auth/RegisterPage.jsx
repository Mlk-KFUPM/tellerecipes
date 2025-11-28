import { useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import BrandMark from "../../components/common/BrandMark.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import ControlledTextField from "../../components/forms/ControlledTextField.jsx";
import PasswordField from "../../components/forms/PasswordField.jsx";
import AuthRedirectPrompt from "../../components/auth/AuthRedirectPrompt.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, "Tell us your name"),
        email: z.string().min(1, "Email is required"),
        password: z.string().min(1, "Password is required"),
      }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "Amina Baker",
      email: "amina.baker@example.com",
      password: "password123",
    },
  });

  const onSubmit = handleSubmit((values) => {
    registerUser({
      username: values.fullName,
      email: values.email,
      password: values.password,
    }).then((user) => {
      const nextRoute =
        user.role === "chef" ? "/app/chef" : user.role === "admin" ? "/app/admin" : "/app/user";
      navigate(nextRoute);
    });
  });

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader
        title="Create your account"
        subtitle="Join TellerRecipes and bring order to your kitchen."
      />
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <ControlledTextField
          control={control}
          name="fullName"
          label="Full name"
          autoComplete="name"
        />
        <ControlledTextField
          control={control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <PasswordField
          control={control}
          name="password"
          label="Password"
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          Create account
        </Button>
      </Stack>
      <AuthRedirectPrompt
        prompt="Already have an account?"
        cta="Sign in"
        href="/auth/login"
      />
      <Typography variant="body2" color="text.secondary">
        Looking to publish your own recipes?{" "}
        <Link component={RouterLink} to="/auth/become-chef" underline="hover">
          Apply to become a chef
        </Link>
      </Typography>
    </AuthLayout>
  );
};

export default RegisterPage;
