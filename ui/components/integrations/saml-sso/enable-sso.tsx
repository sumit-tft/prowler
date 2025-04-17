import React from "react";

import { CustomButton } from "@/components/ui/custom";

interface EnableSSOSectionProps {
  handleEnable: () => void;
}

const EnableSSOSection: React.FC<EnableSSOSectionProps> = ({
  handleEnable,
}) => {
  return (
    <div className="mr-2 mt-2 flex justify-end">
      <CustomButton
        ariaLabel="Enable"
        variant="light"
        color="success"
        size="md"
        onPress={handleEnable}
      >
        Enable
      </CustomButton>
    </div>
  );
};

export default EnableSSOSection;
