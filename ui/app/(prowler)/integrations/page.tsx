import React from "react";

import { IntegrationsClient } from "@/components/integrations/integrations";
import { ContentLayout } from "@/components/ui";

export default function Integrations() {
  return (
    <ContentLayout title="Integrations" icon="tabler:puzzle">
      <p>Integrations</p>
      <IntegrationsClient />
    </ContentLayout>
  );
}
