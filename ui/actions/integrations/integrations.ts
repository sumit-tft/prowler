"use server";

import {
  apiBaseUrl,
  getAuthHeaders,
  getErrorMessage,
  parseStringify,
} from "@/lib";

export const getIntegrationInfo = async () => {
  // TODO: Need to uncomment to get the actual response and remove the static response
  // const headers = await getAuthHeaders({ contentType: false });
  // const url = new URL(`${apiBaseUrl}/integrations`);

  try {
    // const response = await fetch(url.toString(), {
    //   method: "GET",
    //   headers,
    // });

    // const result = await response.json();
    // return parseStringify(result);
    const result = {
      data: [
        {
          type: "integrations",
          id: "497f6eca-6276-4993-bfeb-53cbbbba6f08",
          attributes: {
            inserted_at: "2019-08-24T14:15:22Z",
            updated_at: "2019-08-24T14:15:22Z",
            enabled: true,
            connected: true,
            connection_last_checked_at: "2019-08-24T14:15:22Z",
            integration_type: "saml",
            configuration: {
              email_domain: "tftus.com",
              saml_metadata: "<xml>Sample metadata</xml>",
            },
          },
          relationships: {
            providers: {
              data: [
                {
                  id: "497f6eca-6276-4993-bfeb-53cbbbba6f08",
                  type: "providers",
                },
              ],
            },
          },
        },
      ],
    };

    return {
      data: result.data || [],
    };
  } catch (error) {
    return {
      data: [],
      error: await getErrorMessage(error),
    };
  }
};

export const createSAMLSSOConfig = async (formData: FormData) => {
  // TODO: Need to uncomment to get the actual response and remove the static response
  // const headers = await getAuthHeaders({ contentType: true });

  const domain = formData.get("email") as string;
  const file = formData.get("file") as File;

  const fileContent = file ? await file.text() : "";
  // const url = new URL(`${apiBaseUrl}/integrations`);
  // const body = JSON.stringify({
  //   data: {
  //     type: "integrations",
  //     attributes: {
  //       integration_type: "saml",
  //       configuration: {
  //         email_domain: domain,
  //         saml_metadata: fileContent,
  //       },
  //     },
  //   },
  // });

  try {
    // const response = await fetch(url.toString(), {
    //   method: "POST",
    //   headers,
    //   body,
    // });

    // const result = await response.json();
    return {
      type: "integrations",
      attributes: {
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        enabled: true,
        connected: true,
        connection_last_checked_at: new Date().toISOString(),
        integration_type: "saml",
        configuration: {
          email_domain: domain,
          saml_metadata: fileContent || "<mock_saml_metadata />",
        },
      },
      relationships: {
        providers: {
          data: [
            {
              id: "497f6eca-6276-4993-bfeb-53cbbbba6f08",
              type: "providers",
            },
          ],
        },
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("API failed, using mock data", error);
  }
};

export const deleteSAMLSSOConfig = async (samlSSOId: string) => {
  const headers = await getAuthHeaders({ contentType: false });

  if (!samlSSOId) {
    return { error: "SAML SSO ID is required" };
  }
  const url = new URL(`${apiBaseUrl}/integrations/${samlSSOId}`);
  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to Delete the SAML SSO");
      } catch {
        throw new Error("Failed to Delete the SAML SSO");
      }
    }
    let data = null;
    if (response.status !== 204) {
      data = await response.json();
    }
    return data || { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error revoking invitation:", error);
    return { error: getErrorMessage(error) };
  }
};

export const updateSAMLSSOConfig = async (formData: FormData) => {
  const headers = await getAuthHeaders({ contentType: true });

  const domain = formData.get("email") as string;
  const file = formData.get("file") as File;
  const id = formData.get("id") as File;

  const fileContent = file ? await file.text() : "";

  const body = JSON.stringify({
    data: {
      type: "integrations",
      attributes: {
        integration_type: "saml",
        configuration: {
          email_domain: domain,
          saml_metadata: fileContent,
        },
      },
    },
  });
  try {
    const url = new URL(`${apiBaseUrl}/integrations/${id}`);
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update provider group: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return parseStringify(data);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};
