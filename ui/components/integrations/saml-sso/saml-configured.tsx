import React from "react";

import { CustomButton } from "@/components/ui/custom";
import { UserProfileProps } from "@/types";

import { CopyToClipboard } from "./copy-to-clipboard";

interface SAMLConfiguredSectionProps {
  showConfigureModal: (id: string) => void;
  deleteConfig: (id: string) => void;
  userProfileInfo: UserProfileProps | null;
  id: string;
  domain: string;
}

const SAMLConfiguredSection: React.FC<SAMLConfiguredSectionProps> = ({
  showConfigureModal,
  deleteConfig,
  userProfileInfo,
  id,
  domain,
}) => {
  return (
    <>
      <div className="mt-2 flex justify-end gap-2">
        <CustomButton
          ariaLabel="Configure SAML SSO"
          variant="light"
          color="success"
          size="md"
          onPress={() => showConfigureModal(id)}
        >
          Configure SAML SSO
        </CustomButton>
        <CustomButton
          ariaLabel="Delete"
          variant="light"
          color="success"
          size="md"
          onPress={() => deleteConfig(id)}
        >
          Delete
        </CustomButton>
      </div>

      <p className="mt-2 block text-sm font-semibold leading-6 text-zinc-800 dark:text-zinc-200">
        Email Domain: {userProfileInfo?.data.attributes.email.split("@")[1]}
      </p>

      <div className="mt-1 rounded-lg border border-slate-300 bg-slate-50/75 px-2 py-3 dark:border-slate-600 dark:bg-slate-800/75">
        <p className="text-prowler-secondary dark:text-prowler-light text-sm font-bold">
          SSO URL (click to copy to clipboard):
        </p>
        <div className="mt-2">
          <CopyToClipboard
            text={`${window.location.origin}/sso/saml/${domain}?action=sign_in`}
          />
        </div>
      </div>
    </>
  );
};

export default SAMLConfiguredSection;
