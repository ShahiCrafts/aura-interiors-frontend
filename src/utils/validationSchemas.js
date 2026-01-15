import * as yup from "yup";

const phoneRegExp = /^[0-9+ ]+$/;

export const shippingSchema = yup.object().shape({
    firstName: yup.string().required("First name is required").min(2, "Minimum 2 characters"),
    lastName: yup.string().required("Last name is required").min(2, "Minimum 2 characters"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(phoneRegExp, "Phone number is not valid")
        .min(7, "Minimum 7 digits")
        .max(15, "Maximum 15 digits"),
    addressLine1: yup.string().required("Street address is required").min(3, "Too short"),
    city: yup.string().required("City is required").min(2, "Too short"),
    postalCode: yup.string().required("ZIP code is required").min(4, "Too short"),
    country: yup.string().required("Country is required").min(2, "Too short"),
});

export const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object().shape({
    firstName: yup.string().required("First name is required").min(2, "Minimum 2 characters"),
    lastName: yup.string().required("Last name is required").min(2, "Minimum 2 characters"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export const addressSchema = yup.object().shape({
    fullName: yup.string().required("Full name is required").min(3, "Minimum 3 characters"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(phoneRegExp, "Phone number is not valid")
        .min(7, "Minimum 7 digits")
        .max(15, "Maximum 15 digits"),
    addressLine1: yup.string().required("Street address is required").min(3, "Too short"),
    addressLine2: yup.string().nullable(),
    city: yup.string().required("City is required").min(2, "Too short"),
    state: yup.string().nullable(),
    postalCode: yup.string().required("Postal code is required").min(4, "Too short"),
    country: yup.string().required("Country is required").min(2, "Too short"),
    label: yup.string().required(),
    customLabel: yup.string().when("label", {
        is: "other",
        then: (schema) => schema.required("Custom label is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    type: yup.string().oneOf(["delivery", "billing"]).required("Address type is required"),
    isDefault: yup.boolean(),
});

export const personalInfoSchema = yup.object().shape({
    firstName: yup.string().required("First name is required").min(2, "Minimum 2 characters"),
    lastName: yup.string().required("Last name is required").min(2, "Minimum 2 characters"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(phoneRegExp, "Phone number is not valid")
        .min(7, "Minimum 7 digits")
        .max(15, "Maximum 15 digits"),
    gender: yup.string().oneOf(["male", "female", "other"], "Invalid gender").nullable(),
    dateOfBirth: yup.date().nullable().max(new Date(), "Date cannot be in the future"),
});

export const contactSchema = yup.object().shape({
    fullName: yup.string().required("Full name is required").min(3, "Minimum 3 characters"),
    email: yup.string().email("Invalid email").required("Email is required"),
    subject: yup.string().required("Subject is required").min(5, "Minimum 5 characters"),
    message: yup.string().required("Message is required").min(10, "Minimum 10 characters"),
});

export const reviewSchema = yup.object().shape({
    rating: yup.number().required("Rating is required").min(1, "Please select at least 1 star"),
    title: yup.string().max(100, "Title too long"),
    comment: yup.string().required("Comment is required").min(10, "Comment too short"),
});

export const forgotPasswordSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
});

export const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup.string().required("New password is required").min(8, "Minimum 8 characters"),
    confirmPassword: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});

export const trackOrderSchema = yup.object().shape({
    orderId: yup.string().trim().required("Order ID is required"),
    email: yup.string().email("Invalid email").trim().required("Email is required"),
});

export const newsletterSchema = yup.object().shape({
    email: yup.string().email("Invalid email address").required("Email is required"),
});

export const resetPasswordSchema = yup.object().shape({
    password: yup.string().required("Password is required").min(8, "Minimum 8 characters"),
    confirmPassword: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password"), null], "Passwords must match"),
});
