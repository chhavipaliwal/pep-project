import { Input } from "@heroui/react";
import { useInvoice } from "../../context";

export default function From() {
  const { formik } = useInvoice();

  return (
    <>
      <div className="w-full lg:w-1/2">
        <h2 className="text-xl font-semibold text-white mb-4">Bill From:</h2>
        <form className="space-y-4">
          <Input
            label="Name"
            placeholder="Your Name"
            value={formik.values?.from?.name}
            onChange={formik.handleChange}
            name="from.name"
            isInvalid={
              formik.touched.from?.name && formik.errors.from?.name
                ? true
                : false
            }
            errorMessage={formik.errors.from?.name}
          />
          <Input
            label="Address"
            placeholder="Your Address"
            value={formik.values?.from?.address}
            onChange={formik.handleChange}
            name="from.address"
          />
          <Input
            label="City"
            placeholder="Your City"
            value={formik.values?.from?.city}
            onChange={formik.handleChange}
            name="from.city"
          />
          <Input
            label="Country"
            placeholder="Your country"
            value={formik.values?.from?.country}
            onChange={formik.handleChange}
            name="from.country"
          />
          <Input
            label="Zip Code"
            placeholder="Your Zip Code"
            value={formik.values?.from?.zipCode}
            onChange={formik.handleChange}
            name="from.zipCode"
          />
          <Input
            label="E-mail"
            placeholder="Your E-mail"
            value={formik.values?.from?.email}
            onChange={formik.handleChange}
            name="from.email"
          />
          <Input
            label="Phone "
            placeholder="Your Phone number"
            value={formik.values?.from?.phonenumber}
            onChange={formik.handleChange}
            name="from.phonenumber"
          />
        </form>
      </div>
    </>
  );
}
