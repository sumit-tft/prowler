from unittest import mock
from uuid import uuid4

from azure.mgmt.network.models import SecurityRule

from prowler.providers.azure.services.network.network_service import SecurityGroup
from tests.providers.azure.azure_fixtures import (
    AZURE_SUBSCRIPTION_ID,
    set_mocked_azure_provider,
)


class Test_network_http_internet_access_restricted:
    def test_no_security_groups(self):
        network_client = mock.MagicMock
        network_client.security_groups = {}

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_azure_provider(),
            ),
            mock.patch(
                "prowler.providers.azure.services.network.network_service.Network",
                new=network_client,
            ) as service_client,
            mock.patch(
                "prowler.providers.azure.services.network.network_client.network_client",
                new=service_client,
            ),
        ):
            from prowler.providers.azure.services.network.network_http_internet_access_restricted.network_http_internet_access_restricted import (
                network_http_internet_access_restricted,
            )

            check = network_http_internet_access_restricted()
            result = check.execute()
            assert len(result) == 0

    def test_network_security_groups_none_destination_port_range(self):
        network_client = mock.MagicMock
        security_group_name = "Security Group Name"
        security_group_id = str(uuid4())

        network_client.security_groups = {
            AZURE_SUBSCRIPTION_ID: [
                SecurityGroup(
                    id=security_group_id,
                    name=security_group_name,
                    location="location",
                    security_rules=[
                        SecurityRule(
                            destination_port_range=None,
                            protocol="TCP",
                            source_address_prefix="Internet",
                            access="Allow",
                            direction="Inbound",
                        )
                    ],
                )
            ]
        }

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_azure_provider(),
            ),
            mock.patch(
                "prowler.providers.azure.services.network.network_service.Network",
                new=network_client,
            ) as service_client,
            mock.patch(
                "prowler.providers.azure.services.network.network_client.network_client",
                new=service_client,
            ),
        ):
            from prowler.providers.azure.services.network.network_http_internet_access_restricted.network_http_internet_access_restricted import (
                network_http_internet_access_restricted,
            )

            check = network_http_internet_access_restricted()
            result = check.execute()
            assert len(result) == 1
            assert result[0].status == "PASS"
            assert (
                result[0].status_extended
                == f"Security Group {security_group_name} from subscription {AZURE_SUBSCRIPTION_ID} has HTTP internet access restricted."
            )
            assert result[0].subscription == AZURE_SUBSCRIPTION_ID
            assert result[0].resource_name == security_group_name
            assert result[0].resource_id == security_group_id
            assert result[0].location == "location"

    def test_network_security_groups_invalid_security_rules(self):
        network_client = mock.MagicMock
        security_group_name = "Security Group Name"
        security_group_id = str(uuid4())

        network_client.security_groups = {
            AZURE_SUBSCRIPTION_ID: [
                SecurityGroup(
                    id=security_group_id,
                    name=security_group_name,
                    location="location",
                    security_rules=[
                        SecurityRule(
                            destination_port_range="80",
                            protocol="TCP",
                            source_address_prefix="Internet",
                            access="Allow",
                            direction="Inbound",
                        )
                    ],
                )
            ]
        }

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_azure_provider(),
            ),
            mock.patch(
                "prowler.providers.azure.services.network.network_service.Network",
                new=network_client,
            ) as service_client,
            mock.patch(
                "prowler.providers.azure.services.network.network_client.network_client",
                new=service_client,
            ),
        ):
            from prowler.providers.azure.services.network.network_http_internet_access_restricted.network_http_internet_access_restricted import (
                network_http_internet_access_restricted,
            )

            check = network_http_internet_access_restricted()
            result = check.execute()
            assert len(result) == 1
            assert result[0].status == "FAIL"
            assert (
                result[0].status_extended
                == f"Security Group {security_group_name} from subscription {AZURE_SUBSCRIPTION_ID} has HTTP internet access allowed."
            )
            assert result[0].subscription == AZURE_SUBSCRIPTION_ID
            assert result[0].resource_name == security_group_name
            assert result[0].resource_id == security_group_id
            assert result[0].location == "location"

    def test_network_security_groups_invalid_security_rules_range(self):
        network_client = mock.MagicMock
        security_group_name = "Security Group Name"
        security_group_id = str(uuid4())

        network_client.security_groups = {
            AZURE_SUBSCRIPTION_ID: [
                SecurityGroup(
                    id=security_group_id,
                    name=security_group_name,
                    location="location",
                    security_rules=[
                        SecurityRule(
                            destination_port_range="20-100",
                            protocol="TCP",
                            source_address_prefix="Internet",
                            access="Allow",
                            direction="Inbound",
                        )
                    ],
                )
            ]
        }

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_azure_provider(),
            ),
            mock.patch(
                "prowler.providers.azure.services.network.network_service.Network",
                new=network_client,
            ) as service_client,
            mock.patch(
                "prowler.providers.azure.services.network.network_client.network_client",
                new=service_client,
            ),
        ):
            from prowler.providers.azure.services.network.network_http_internet_access_restricted.network_http_internet_access_restricted import (
                network_http_internet_access_restricted,
            )

            check = network_http_internet_access_restricted()
            result = check.execute()
            assert len(result) == 1
            assert result[0].status == "FAIL"
            assert (
                result[0].status_extended
                == f"Security Group {security_group_name} from subscription {AZURE_SUBSCRIPTION_ID} has HTTP internet access allowed."
            )
            assert result[0].subscription == AZURE_SUBSCRIPTION_ID
            assert result[0].resource_name == security_group_name
            assert result[0].resource_id == security_group_id
            assert result[0].location == "location"

    def test_network_security_groups_valid_security_rules(self):
        network_client = mock.MagicMock
        security_group_name = "Security Group Name"
        security_group_id = str(uuid4())

        network_client.security_groups = {
            AZURE_SUBSCRIPTION_ID: [
                SecurityGroup(
                    id=security_group_id,
                    name=security_group_name,
                    location="location",
                    security_rules=[
                        SecurityRule(
                            destination_port_range="23",
                            protocol="TCP",
                            source_address_prefix="Internet",
                            access="Allow",
                            direction="Inbound",
                        )
                    ],
                )
            ]
        }

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_azure_provider(),
            ),
            mock.patch(
                "prowler.providers.azure.services.network.network_service.Network",
                new=network_client,
            ) as service_client,
            mock.patch(
                "prowler.providers.azure.services.network.network_client.network_client",
                new=service_client,
            ),
        ):
            from prowler.providers.azure.services.network.network_http_internet_access_restricted.network_http_internet_access_restricted import (
                network_http_internet_access_restricted,
            )

            check = network_http_internet_access_restricted()
            result = check.execute()
            assert len(result) == 1
            assert result[0].status == "PASS"
            assert (
                result[0].status_extended
                == f"Security Group {security_group_name} from subscription {AZURE_SUBSCRIPTION_ID} has HTTP internet access restricted."
            )
            assert result[0].subscription == AZURE_SUBSCRIPTION_ID
            assert result[0].resource_name == security_group_name
            assert result[0].resource_id == security_group_id
            assert result[0].location == "location"
