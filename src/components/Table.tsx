import React from "react";

import {
  Table as ChakraTable,
  TableContainer,
  TableContainerProps,
  Tbody,
  Th,
  Thead,
  ThemingProps,
  Tr,
} from "@chakra-ui/react";

interface TableProps extends TableContainerProps {
  variant: ThemingProps<"Table">["variant"];
  children: React.ReactNode;
  tableHeaders: string[];
}

export function Table({
  variant,
  children,
  tableHeaders,
  ...rest
}: TableProps) {
  return (
    <TableContainer {...rest}>
      <ChakraTable size={{ base: "sm", md: "md" }} variant={variant}>
        <Thead>
          <Tr>
            {tableHeaders.map((th) => (
              <Th key={th}>{th}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </ChakraTable>
    </TableContainer>
  );
}
