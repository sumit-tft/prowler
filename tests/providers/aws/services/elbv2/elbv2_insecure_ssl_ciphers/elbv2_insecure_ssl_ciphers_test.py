from unittest import mock

from boto3 import client, resource
from moto import mock_aws

from tests.providers.aws.utils import (
    AWS_REGION_EU_WEST_1,
    AWS_REGION_EU_WEST_1_AZA,
    AWS_REGION_EU_WEST_1_AZB,
    AWS_REGION_US_EAST_1,
    set_mocked_aws_provider,
)


class Test_elbv2_insecure_ssl_ciphers:
    @mock_aws
    def test_elb_no_balancers(self):
        from prowler.providers.aws.services.elbv2.elbv2_service import ELBv2

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_aws_provider(
                    [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1]
                ),
            ),
            mock.patch(
                "prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers.elbv2_client",
                new=ELBv2(
                    set_mocked_aws_provider(
                        [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1],
                        create_default_organization=False,
                    )
                ),
            ),
        ):
            # Test Check
            from prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers import (
                elbv2_insecure_ssl_ciphers,
            )

            check = elbv2_insecure_ssl_ciphers()
            result = check.execute()

            assert len(result) == 0

    @mock_aws
    def test_elbv2_listener_with_secure_policy(self):
        conn = client("elbv2", region_name=AWS_REGION_EU_WEST_1)
        ec2 = resource("ec2", region_name=AWS_REGION_EU_WEST_1)

        security_group = ec2.create_security_group(
            GroupName="a-security-group", Description="First One"
        )
        vpc = ec2.create_vpc(CidrBlock="172.28.7.0/24", InstanceTenancy="default")
        subnet1 = ec2.create_subnet(
            VpcId=vpc.id,
            CidrBlock="172.28.7.192/26",
            AvailabilityZone=AWS_REGION_EU_WEST_1_AZA,
        )
        subnet2 = ec2.create_subnet(
            VpcId=vpc.id,
            CidrBlock="172.28.7.0/26",
            AvailabilityZone=AWS_REGION_EU_WEST_1_AZB,
        )

        lb = conn.create_load_balancer(
            Name="my-lb",
            Subnets=[subnet1.id, subnet2.id],
            SecurityGroups=[security_group.id],
            Scheme="internal",
            Type="application",
        )["LoadBalancers"][0]

        response = conn.create_target_group(
            Name="a-target",
            Protocol="HTTP",
            Port=8080,
            VpcId=vpc.id,
            HealthCheckProtocol="HTTP",
            HealthCheckPort="8080",
            HealthCheckPath="/",
            HealthCheckIntervalSeconds=5,
            HealthCheckTimeoutSeconds=3,
            HealthyThresholdCount=5,
            UnhealthyThresholdCount=2,
            Matcher={"HttpCode": "200"},
        )
        target_group = response.get("TargetGroups")[0]
        target_group_arn = target_group["TargetGroupArn"]
        response = conn.create_listener(
            LoadBalancerArn=lb["LoadBalancerArn"],
            Protocol="HTTPS",
            Port=443,
            SslPolicy="ELBSecurityPolicy-TLS-1-2-2017-01",
            DefaultActions=[{"Type": "forward", "TargetGroupArn": target_group_arn}],
        )

        from prowler.providers.aws.services.elbv2.elbv2_service import ELBv2

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_aws_provider(
                    [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1]
                ),
            ),
            mock.patch(
                "prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers.elbv2_client",
                new=ELBv2(
                    set_mocked_aws_provider(
                        [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1],
                        create_default_organization=False,
                    )
                ),
            ),
        ):
            from prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers import (
                elbv2_insecure_ssl_ciphers,
            )

            check = elbv2_insecure_ssl_ciphers()
            result = check.execute()

            assert len(result) == 1
            assert result[0].status == "PASS"
            assert (
                result[0].status_extended
                == "ELBv2 my-lb does not have insecure SSL protocols or ciphers."
            )
            assert result[0].resource_id == "my-lb"
            assert result[0].resource_arn == lb["LoadBalancerArn"]

    @mock_aws
    def test_elbv2_with_HTTPS_listener(self):
        conn = client("elbv2", region_name=AWS_REGION_EU_WEST_1)
        ec2 = resource("ec2", region_name=AWS_REGION_EU_WEST_1)

        security_group = ec2.create_security_group(
            GroupName="a-security-group", Description="First One"
        )
        vpc = ec2.create_vpc(CidrBlock="172.28.7.0/24", InstanceTenancy="default")
        subnet1 = ec2.create_subnet(
            VpcId=vpc.id,
            CidrBlock="172.28.7.192/26",
            AvailabilityZone=AWS_REGION_EU_WEST_1_AZA,
        )
        subnet2 = ec2.create_subnet(
            VpcId=vpc.id,
            CidrBlock="172.28.7.0/26",
            AvailabilityZone=AWS_REGION_EU_WEST_1_AZB,
        )

        lb = conn.create_load_balancer(
            Name="my-lb",
            Subnets=[subnet1.id, subnet2.id],
            SecurityGroups=[security_group.id],
            Scheme="internal",
        )["LoadBalancers"][0]

        response = conn.create_target_group(
            Name="a-target",
            Protocol="HTTP",
            Port=8080,
            VpcId=vpc.id,
            HealthCheckProtocol="HTTP",
            HealthCheckPort="8080",
            HealthCheckPath="/",
            HealthCheckIntervalSeconds=5,
            HealthCheckTimeoutSeconds=3,
            HealthyThresholdCount=5,
            UnhealthyThresholdCount=2,
            Matcher={"HttpCode": "200"},
        )
        target_group = response.get("TargetGroups")[0]
        target_group_arn = target_group["TargetGroupArn"]
        response = conn.create_listener(
            LoadBalancerArn=lb["LoadBalancerArn"],
            Protocol="HTTPS",
            SslPolicy="ELBSecurityPolicy-TLS-1-1-2017-01",
            DefaultActions=[{"Type": "forward", "TargetGroupArn": target_group_arn}],
        )

        from prowler.providers.aws.services.elbv2.elbv2_service import ELBv2

        with (
            mock.patch(
                "prowler.providers.common.provider.Provider.get_global_provider",
                return_value=set_mocked_aws_provider(
                    [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1]
                ),
            ),
            mock.patch(
                "prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers.elbv2_client",
                new=ELBv2(
                    set_mocked_aws_provider(
                        [AWS_REGION_EU_WEST_1, AWS_REGION_US_EAST_1],
                        create_default_organization=False,
                    )
                ),
            ),
        ):
            from prowler.providers.aws.services.elbv2.elbv2_insecure_ssl_ciphers.elbv2_insecure_ssl_ciphers import (
                elbv2_insecure_ssl_ciphers,
            )

            check = elbv2_insecure_ssl_ciphers()
            result = check.execute()

            assert len(result) == 1
            assert result[0].status == "FAIL"
            assert (
                result[0].status_extended
                == "ELBv2 my-lb has listeners with insecure SSL protocols or ciphers (ELBSecurityPolicy-TLS-1-1-2017-01)."
            )
            assert result[0].resource_id == "my-lb"
            assert result[0].resource_arn == lb["LoadBalancerArn"]
