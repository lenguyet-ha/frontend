import React, { memo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
} from "@mui/material";
import { Category } from "@mui/icons-material";

interface CategoryType {
  id: number;
  name: string;
  logo: string | null;
  parentCategoryId: number | null;
}

interface CategorySidebarProps {
  categories: CategoryType[];
  selectedCategories: number[];
  onCategoryClick: (categoryId: number) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = memo(({
  categories,
  selectedCategories,
  onCategoryClick,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Danh mục sản phẩm
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category.id}>
            <ListItemButton
              onClick={() => onCategoryClick(category.id)}
              selected={selectedCategories.includes(category.id)}
            >
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
});

CategorySidebar.displayName = "CategorySidebar";

export default CategorySidebar;
