import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Center,
  Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import useBreadcrumbs from "use-react-router-breadcrumbs";

const CollectionBreadcrumb = ({ collections, match }) => {
  if (!collections) return <span>...</span>;
  let item = collections.find((x) => x.author === match.params.author_id);
  return <span>{item?.name}</span>;
};

export const Breadcrumbs = ({ collections }) => {
  const routes = [
    {
      path: "/marketplace/:author_id",
      breadcrumb: CollectionBreadcrumb,
      props: { collections },
    },
  ];

  const breadcrumbs = useBreadcrumbs(routes);

  return (
    <Box mb={3} pl="22px" color="gray.600">
      <Breadcrumb fontWeight="medium" fontSize="sm">
        {breadcrumbs.map(({ match, breadcrumb }) => (
          <BreadcrumbItem key={match.pathname}>
            <BreadcrumbLink as={Link} to={match.pathname}>
              {breadcrumb}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </Box>
  );
};
