import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  createSAMLSSOConfig,
  updateSAMLSSOConfig,
} from "@/actions/integrations";
import {
  CustomAlertModal,
  CustomButton,
  CustomInput,
} from "@/components/ui/custom";
import { Form } from "@/components/ui/form";
import {
  samlSSOIntegrationFormSchema as formSchema,
  UserProfileProps,
} from "@/types";

import { CopyToClipboard } from "./copy-to-clipboard";

interface ConfigureModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  samlConfiguredId: string;
  userProfileInfo: UserProfileProps | null;
}

export const ConfigureModal: React.FC<ConfigureModalProps> = ({
  showModal,
  setShowModal,
  samlConfiguredId,
  userProfileInfo,
}) => {
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailDomain: "",
      file: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("email", data.emailDomain);
    formData.append("file", data.file[0]);

    if (samlConfiguredId) {
      await updateSAMLSSOConfig(formData);
      // TODO: Need to update the value based on response coming from API
      setShowModal(false);
    } else {
      const response = await createSAMLSSOConfig(formData);
      if (response?.attributes.integration_type === "saml") {
        form.reset();
        setShowModal(false);
      }
    }
  };

  useEffect(() => {
    if (userProfileInfo) {
      const domainFromEmail =
        userProfileInfo?.data.attributes.email.split("@")[1];

      form.reset({
        emailDomain: domainFromEmail,
        file: undefined,
      });
    }
  }, [userProfileInfo, form]);

  return (
    <div className="flex w-full items-center justify-end">
      <CustomAlertModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        title="Configure SAML SSO"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <CustomInput
              control={form.control}
              name="emailDomain"
              type="text"
              label="Email Domain"
              placeholder="(e.g., example.com)"
              isInvalid={!!form.formState.errors.emailDomain}
            />

            <div>
              <p className="block text-sm font-semibold leading-6 text-zinc-800 dark:text-zinc-200">
                Identity Provider Configuration
              </p>

              <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50/75 px-2 py-3 dark:border-slate-600 dark:bg-slate-800/75">
                <p className="text-prowler-secondary dark:text-prowler-light text-sm font-bold">
                  ACS URL (click to copy to clipboard):
                </p>
                <div className="mt-2">
                  <CopyToClipboard
                    text={`${window.location.origin}/saml/sp/consume/${form.watch("emailDomain")}`}
                  />
                </div>

                <p className="text-prowler-secondary dark:text-prowler-light mt-2 text-sm font-bold">
                  Audience (click to copy to clipboard):
                </p>
                <div className="mt-2">
                  <CopyToClipboard text={"urn:prowler.com:sp"} />
                </div>
                <p className="text-prowler-secondary dark:text-prowler-light mt-2 text-sm font-bold">
                  Name ID Format:
                </p>
                <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
                  urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
                </p>
                <p className="text-prowler-secondary dark:text-prowler-light mt-2 text-sm font-bold">
                  Supported Assertion Attributes:
                </p>
                <ul className="ml-6 list-disc text-zinc-800 dark:text-zinc-200">
                  <li>
                    <span className="font-mono text-sm">firstName</span>
                  </li>
                  <li>
                    <span className="font-mono text-sm">lastName</span>
                  </li>
                  <li>
                    <span className="font-mono text-sm">userType</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="font-bold">Note:</span>
                  The <span className="font-mono">userType</span>
                  attribute will be used to assign the user&#39;s role. If the
                  role does not exist, one will be created with minimal
                  permissions. You can assign permissions to roles on the&nbsp;
                  <Link href="/app/roles" className="text-blue-600">
                    Roles
                  </Link>
                  &nbsp;page.
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="block text-sm font-semibold leading-6 text-zinc-800 dark:text-zinc-200">
                Metadata XML (from your identity provider)
              </p>

              <input
                type="file"
                accept=".xml"
                {...form.register("file")}
                className="focus:ring-prowler-focus dark:focus:ring-prowler-dark-focus block w-full rounded-md bg-slate-50 py-1 shadow-sm focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-zinc-200"
              />

              {form.formState.errors.file?.message && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.file?.message)}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              <CustomButton
                ariaLabel="cancel"
                variant="solid"
                color="transparent"
                size="md"
                onPress={() => setShowModal(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                ariaLabel="Save"
                variant="solid"
                color="action"
                size="md"
                type="submit"
              >
                Save
              </CustomButton>
            </div>
          </form>
        </Form>
      </CustomAlertModal>
    </div>
  );
};
