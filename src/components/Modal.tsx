import React from "react";

import {
  Button,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps as ChakraModalProps,
  TypographyProps,
} from "@chakra-ui/react";

interface ModalProps extends Omit<ChakraModalProps, "children"> {
  bodyChildren: React.ReactNode;
  footerChildren?: React.ReactNode;
  headerOptions?: {
    title?: string;
    fontSize?: TypographyProps["fontSize"];
  };
}

export function Modal({
  onClose,
  bodyChildren,
  footerChildren,
  headerOptions,
  ...rest
}: ModalProps) {
  return (
    <ChakraModal onClose={onClose} {...rest}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={headerOptions?.fontSize ?? ""}>
          {headerOptions?.title ?? ""}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{bodyChildren}</ModalBody>
        <ModalFooter>
          {footerChildren ?? (
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
}
