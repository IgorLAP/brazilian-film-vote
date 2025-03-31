import React from "react";

import { Table as ChakraTable, TableRootProps } from "@chakra-ui/react";

interface TableProps extends TableRootProps {
  children: React.ReactNode;
  tableHeaders: string[];
}

export function Table({ children, tableHeaders, ...rest }: TableProps) {
  return (
    <ChakraTable.Root size={{ base: "sm", md: "md" }} {...rest}>
      <ChakraTable.Header>
        <ChakraTable.Row>
          {tableHeaders.map((th) => (
            <ChakraTable.ColumnHeader key={th}>{th}</ChakraTable.ColumnHeader>
          ))}
        </ChakraTable.Row>
      </ChakraTable.Header>
      <ChakraTable.Body>{children}</ChakraTable.Body>
    </ChakraTable.Root>
  );
}
