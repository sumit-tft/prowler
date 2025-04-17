"use client";

import { ChevronDown, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import {
  deleteSAMLSSOConfig,
  getIntegrationInfo,
} from "@/actions/integrations";
import { getProfileInfo } from "@/actions/users/users";
import { cn } from "@/lib";
import { Integration, IntegrationsState } from "@/types";
import { UserProfileProps } from "@/types";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible/collapsible";
import { ConfigureModal } from "./saml-sso";
import EnableSSOSection from "./saml-sso/enable-sso";
import SAMLConfiguredSection from "./saml-sso/saml-configured";

export const IntegrationsClient = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfileProps | null>(null);
  const [integrationsData, setIntegrationsData] = useState<IntegrationsState>({
    data: [],
  });
  const [samlConfiguredId, setSamlConfiguredId] = useState<string>("");

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEnable = () => {
    setShowModal(true);
  };

  const fetchIntegrationDetails = async () => {
    const response = await getIntegrationInfo();
    setIntegrationsData(response);
  };

  const fetchProfile = async () => {
    const res = await getProfileInfo();
    setUserProfile(res);
  };

  useEffect(() => {
    fetchIntegrationDetails();
    fetchProfile();
  }, []);

  const deleteSamlSsoConfig = (id: string) => {
    deleteSAMLSSOConfig(id);
  };

  const handleConfigureModal = (id: string) => {
    setShowModal(true);
    setSamlConfiguredId(id);
  };

  type Section = {
    id: string;
    title: string;
    content: JSX.Element | null;
    icon: JSX.Element;
  };

  const sections: Section[] = integrationsData?.data
    .map((integration: Integration, index: number): Section | null => {
      const {
        id,
        attributes: { integration_type, enabled, configuration },
      } = integration;

      const sectionId = id || index.toString();
      const icon = <Lock size={20} />;

      if (integration_type === "saml") {
        const hasMetadata = false;
        //typeof configuration === "object" && !!configuration?.saml_metadata;

        return {
          id: sectionId,
          icon,
          title: "SAML SSO",
          content:
            enabled && hasMetadata ? (
              <SAMLConfiguredSection
                id={id}
                domain={configuration.email_domain}
                showConfigureModal={handleConfigureModal}
                deleteConfig={deleteSamlSsoConfig}
                userProfileInfo={userProfile}
              />
            ) : (
              <EnableSSOSection handleEnable={handleEnable} />
            ),
        };
      }

      if (integration_type === "amazon_s3") {
        return {
          id: sectionId,
          icon,
          title: "Amazon S3 Storage",
          content: <> </>,
        };
      }

      return null;
    })
    .filter(Boolean) as Section[];

  return (
    <>
      <div>
        {sections?.map((section) => (
          <Collapsible
            key={section.id}
            open={openSections[section.id] || false}
            onOpenChange={() => toggleSection(section.id)}
            className="w-full p-2"
          >
            <CollapsibleTrigger
              className="flex w-full items-center justify-between border-b border-gray-200 px-4 py-2 [&[data-state=open]>div>svg]:rotate-180"
              asChild
            >
              <div className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <span>{section.icon}</span>
                  <p className="text-stone -ml-1.5 align-middle text-sm font-medium">
                    {section.title}
                  </p>
                </div>

                <ChevronDown
                  size={20}
                  className={cn(
                    "h-4 w-4 transition-transform duration-400 ease-in-out",
                    openSections[section.id] ? "rotate-180" : "rotate-0",
                  )}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {section.content}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <ConfigureModal
        showModal={showModal}
        setShowModal={setShowModal}
        samlConfiguredId={samlConfiguredId}
        userProfileInfo={userProfile}
      />
    </>
  );
};
