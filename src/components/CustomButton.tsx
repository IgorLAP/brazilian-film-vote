import React from "react";

import { Button, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  buttonType: "primary" | "danger" | "warn";
  children: React.ReactNode;
}

export function CustomButton({
  buttonType,
  children,
  ...rest
}: CustomButtonProps) {
  return (
    <>
      {buttonType === "primary" && (
        <Button bg="blue.500" _hover={{ bg: "blue.600" }} {...rest}>
          {children}
        </Button>
      )}
      {buttonType === "danger" && (
        <Button bg="red.500" _hover={{ bg: "red.600" }} {...rest}>
          {children}
        </Button>
      )}
      {buttonType === "warn" && (
        <Button bg="yellow.500" _hover={{ bg: "yellow.600" }} {...rest}>
          {children}
        </Button>
      )}
    </>
  );
}
