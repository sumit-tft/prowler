from unittest.mock import patch

import botocore
from boto3 import client
from moto import mock_aws

from tests.providers.aws.utils import (
    AWS_ACCOUNT_NUMBER,
    AWS_REGION_EU_WEST_1,
    set_mocked_aws_provider,
)

orig = botocore.client.BaseClient._make_api_call


class Test_guardduty_lambda_protection_enabled:
    def test_no_detectors(self):
        aws_provider = set_mocked_aws_provider()

        from prowler.providers.aws.services.guardduty.guardduty_service import GuardDuty

        with (
            patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=aws_provider,
            ),
            patch(
                "prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled.guardduty_client",
                new=GuardDuty(aws_provider),
            ),
        ):
            # Test Check
            from prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled import (
                guardduty_lambda_protection_enabled,
            )

            check = guardduty_lambda_protection_enabled()
            result = check.execute()

            assert len(result) == 0

    @mock_aws
    def test_detector_disabled(self):
        guardduty_client = client("guardduty", region_name=AWS_REGION_EU_WEST_1)

        guardduty_client.create_detector(Enable=False)

        aws_provider = set_mocked_aws_provider()

        from prowler.providers.aws.services.guardduty.guardduty_service import GuardDuty

        with (
            patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=aws_provider,
            ),
            patch(
                "prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled.guardduty_client",
                new=GuardDuty(aws_provider),
            ),
        ):
            # Test Check
            from prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled import (
                guardduty_lambda_protection_enabled,
            )

            check = guardduty_lambda_protection_enabled()
            result = check.execute()

            assert len(result) == 0

    @mock_aws
    def test_detector_lambda_protection_enabled(self):
        guardduty_client = client("guardduty", region_name=AWS_REGION_EU_WEST_1)

        detector_id = guardduty_client.create_detector(
            Enable=True,
            Features=[{"Name": "LAMBDA_NETWORK_LOGS", "Status": "ENABLED"}],
        )["DetectorId"]

        aws_provider = set_mocked_aws_provider()

        from prowler.providers.aws.services.guardduty.guardduty_service import GuardDuty

        with (
            patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=aws_provider,
            ),
            patch(
                "prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled.guardduty_client",
                new=GuardDuty(aws_provider),
            ),
        ):
            # Test Check
            from prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled import (
                guardduty_lambda_protection_enabled,
            )

            check = guardduty_lambda_protection_enabled()
            result = check.execute()

            assert len(result) == 1
            assert result[0].status == "PASS"
            assert (
                result[0].status_extended
                == f"GuardDuty detector {detector_id} has Lambda Protection enabled."
            )
            assert result[0].resource_id == detector_id
            assert result[0].region == AWS_REGION_EU_WEST_1
            assert (
                result[0].resource_arn
                == f"arn:aws:guardduty:{AWS_REGION_EU_WEST_1}:{AWS_ACCOUNT_NUMBER}:detector/{detector_id}"
            )
            assert result[0].resource_tags == []

    @mock_aws
    def test_detector_lambda_protection_disabled(self):
        guardduty_client = client("guardduty", region_name=AWS_REGION_EU_WEST_1)

        detector_id = guardduty_client.create_detector(
            Enable=True,
            Features=[{"Name": "LAMBDA_NETWORK_LOGS", "Status": "DISABLED"}],
        )["DetectorId"]

        aws_provider = set_mocked_aws_provider()

        from prowler.providers.aws.services.guardduty.guardduty_service import GuardDuty

        with (
            patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=aws_provider,
            ),
            patch(
                "prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled.guardduty_client",
                new=GuardDuty(aws_provider),
            ),
        ):
            # Test Check
            from prowler.providers.aws.services.guardduty.guardduty_lambda_protection_enabled.guardduty_lambda_protection_enabled import (
                guardduty_lambda_protection_enabled,
            )

            check = guardduty_lambda_protection_enabled()
            result = check.execute()

            assert len(result) == 1
            assert result[0].status == "FAIL"
            assert (
                result[0].status_extended
                == f"GuardDuty detector {detector_id} does not have Lambda Protection enabled."
            )
            assert result[0].resource_id == detector_id
            assert result[0].region == AWS_REGION_EU_WEST_1
            assert (
                result[0].resource_arn
                == f"arn:aws:guardduty:{AWS_REGION_EU_WEST_1}:{AWS_ACCOUNT_NUMBER}:detector/{detector_id}"
            )
            assert result[0].resource_tags == []
