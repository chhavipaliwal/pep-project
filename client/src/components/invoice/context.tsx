import { useFormik } from "formik";
import { useContext, createContext, ReactNode, useEffect } from "react";
import { InvoiceType } from "../../libs/interface";
import { generatePDF } from "../../libs/actions";
import { addToast } from "@heroui/react";
import { format } from "date-fns";
import { invoiceSchema } from "../../libs/validations";
import axios from "axios";
import { API_URL } from "../../libs/config";

type InvoiceContextType = {
  formik: ReturnType<typeof useFormik<InvoiceType>>;
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const InvoiceProvider = ({ children }: Props) => {
  const formik = useFormik<InvoiceType>({
    initialValues: {
      tabsKey: "from-to",
      companyName: "",
      from: {
        name: "",
        address: "",
        zipCode: "",
        city: "",
        country: "",
        email: "",
        phonenumber: "",
      },
      to: {
        name: "",
        address: "",
        zipCode: "",
        city: "",
        country: "",
        email: "",
        phonenumber: "",
      },
      invoiceDetails: {
        invoiceNo: format(new Date(), "yyyyMMdd"),
        invoiceDate: "",
        dueDate: "",
      },
      currency: "INR",
      lineItems: [
        {
          id: 1,
          name: "",
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],
      paymentInfo: {
        bankName: "",
        accountName: "",
        accountNumber: "",
      },
      summary: {
        subtotal: 0,
        total: 0,
        discount: {
          isDiscount: false,
          amount: 0,
          type: "fixed",
        },
        shipping: {
          isShipping: false,
          amount: 0,
        },
        tax: {
          isTax: false,
          amount: 0,
          type: "fixed",
        },
        totalDiscount: 0,
        totalShipping: 0,
        totalTax: 0,
        isInWords: false,
        additionalNotes: "",
        termsAndConditions: "",
      },
    },
    validationSchema: invoiceSchema,
    onSubmit: async (values) => {
      await generatePDF(values)
        .then(async () => {
          addToast({
            title: "Invoice Saved",
            description: "Invoice saved successfully",
            color: "success",
            promise: new Promise(async (resolve, reject) => {
              await axios
                .post(API_URL + "/api/invoices", values)
                .then(() => {
                  resolve(true);
                })
                .catch((err) => {
                  reject(err);
                });
            }),
          });
        })
        .catch(() => {
          addToast({
            title: "Error",
            description: "Error downloading invoice",
            color: "danger",
          });
        });
    },
  });

  useEffect(() => {
    const tax = formik.values.summary.tax.isTax
      ? formik.values.summary.tax.type === "fixed"
        ? formik.values.summary.tax.amount
        : (formik.values.summary.subtotal * formik.values.summary.tax.amount) /
          100
      : 0;

    const discount = formik.values.summary.discount.isDiscount
      ? formik.values.summary.discount.type === "fixed"
        ? formik.values.summary.discount.amount
        : (formik.values.summary.subtotal *
            formik.values.summary.discount.amount) /
          100
      : 0;

    const shipping = formik.values.summary.shipping.isShipping
      ? formik.values.summary.shipping.amount
      : 0;

    formik.setFieldValue(
      "summary.subtotal",
      formik.values.lineItems.reduce(
        (acc, item) => acc + item.rate * item.quantity,
        0
      )
    );

    formik.values.summary.tax.isTax &&
      formik.setFieldValue("summary.totalTax", tax);

    formik.values.summary.discount.isDiscount &&
      formik.setFieldValue("summary.totalDiscount", discount);

    formik.values.summary.shipping.isShipping &&
      formik.setFieldValue("summary.totalShipping", shipping);

    formik.setFieldValue(
      "summary.total",
      formik.values.summary.subtotal - discount + shipping + tax
    );
  }, [
    formik.values.lineItems,
    formik.values.summary.discount,
    formik.values.summary.tax,
    formik.values.summary.shipping,
  ]);

  return (
    <InvoiceContext.Provider value={{ formik }}>
      {children}
    </InvoiceContext.Provider>
  );
};
