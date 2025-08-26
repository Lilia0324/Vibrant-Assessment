import React from 'react';
import { Table, Input, Tag } from 'antd';
import { ColumnsType, FilterValue, SorterResult } from 'antd/es/table/interface';
import { useNavigate, useLocation } from 'react-router-dom';
import qs from 'qs';
import type { TablePaginationConfig } from 'antd/lib/table';

export const mockInventory: InventoryItem[] = [
  { id: 1, name: 'Apple', quantity: 150, expirationDate: '2026-01-15', supplier: 'Fruit Co.', category: 'Produce' },
  { id: 2, name: 'Milk', quantity: 50, expirationDate: '2025-10-20', supplier: 'Dairy Farms', category: 'Dairy' },
  { id: 3, name: 'Bread', quantity: 75, expirationDate: '2025-09-01', supplier: 'Bakery Inc.', category: 'Bakery' },
  { id: 4, name: 'Chicken Breast', quantity: 200, expirationDate: '2026-02-10', supplier: 'Poultry Co.', category: 'Meat' },
  { id: 5, name: 'Eggs', quantity: 120, expirationDate: '2025-10-25', supplier: 'Happy Hen', category: 'Dairy' },
  { id: 6, name: 'Banana', quantity: 180, expirationDate: '2026-01-20', supplier: 'Fruit Co.', category: 'Produce' },
  { id: 7, name: 'Yogurt', quantity: 90, expirationDate: '2025-11-05', supplier: 'Dairy Farms', category: 'Dairy' },
  { id: 8, name: 'Salmon Fillet', quantity: 60, expirationDate: '2026-02-15', supplier: 'Ocean Foods', category: 'Seafood' },
  { id: 9, name: 'Rice', quantity: 300, expirationDate: '2027-05-30', supplier: 'Grain Supply', category: 'Dry Goods' },
  { id: 10, name: 'Pasta', quantity: 250, expirationDate: '2027-04-20', supplier: 'Noodle Co.', category: 'Dry Goods' },
  { id: 11, name: 'Orange Juice', quantity: 80, expirationDate: '2025-11-10', supplier: 'Beverage Co.', category: 'Beverages' },
  { id: 12, name: 'Ground Beef', quantity: 110, expirationDate: '2026-02-28', supplier: 'Poultry Co.', category: 'Meat' },
  { id: 13, name: 'Cereal', quantity: 130, expirationDate: '2027-08-15', supplier: 'Breakfast Foods', category: 'Dry Goods' },
  { id: 14, name: 'Broccoli', quantity: 95, expirationDate: '2026-01-25', supplier: 'Fresh Veggies', category: 'Produce' },
  { id: 15, name: 'Cheddar Cheese', quantity: 45, expirationDate: '2025-12-01', supplier: 'Dairy Farms', category: 'Dairy' },
  { id: 16, name: 'Lettuce', quantity: 105, expirationDate: '2026-01-10', supplier: 'Fresh Veggies', category: 'Produce' },
  { id: 17, name: 'Soda', quantity: 220, expirationDate: '2027-09-01', supplier: 'Fizz Drinks', category: 'Beverages' },
  { id: 18, name: 'Frozen Peas', quantity: 160, expirationDate: '2028-03-20', supplier: 'Arctic Foods', category: 'Frozen' },
  { id: 19, name: 'Ice Cream', quantity: 70, expirationDate: '2026-06-15', supplier: 'Sweet Treats', category: 'Frozen' },
  { id: 20, name: 'Tuna (canned)', quantity: 350, expirationDate: '2027-11-01', supplier: 'Ocean Foods', category: 'Canned Goods' },
  { id: 21, name: 'Soup (canned)', quantity: 190, expirationDate: '2028-01-20', supplier: 'Comfort Foods', category: 'Canned Goods' },
  { id: 22, name: 'Crackers', quantity: 140, expirationDate: '2026-09-10', supplier: 'Snack Co.', category: 'Snacks' },
  { id: 23, name: 'Chips', quantity: 210, expirationDate: '2026-10-05', supplier: 'Snack Co.', category: 'Snacks' },
  { id: 24, name: 'Pork Chops', quantity: 85, expirationDate: '2026-03-05', supplier: 'Meat Solutions', category: 'Meat' },
  { id: 25, name: 'Shrimp', quantity: 55, expirationDate: '2026-02-25', supplier: 'Ocean Foods', category: 'Seafood' },
];

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  expirationDate: string;
  supplier: string;
  category: string;
}

interface TableQueryParams {
  page?: number;
  q?: string;
  category?: string[];
  sort?: string;
  order?: string;
}

const categoryFilters = Array.from(new Set(mockInventory.map(item => item.category))).map(category => ({
  text: category,
  value: category,
}));

export const InventoryTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  const getSortOrder = (key: string): 'ascend' | 'descend' | null => {
    const sort = urlParams.sort as string;
    const order = urlParams.order as string;
    if (sort === key) {
      return order === 'ascend' ? 'ascend' : 'descend';
    }
    return null;
  };

  const filteredCategories = (urlParams.category as string[]) || [];
  const nameSearch = (urlParams.q as string) || '';

  // Filter and sort the data directly on render based on URL parameters
  const filteredAndSortedData = React.useMemo(() => {
    let result = [...mockInventory];

    if (nameSearch) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    if (filteredCategories.length) {
      result = result.filter(item =>
        filteredCategories.includes(item.category)
      );
    }

    const sort = urlParams.sort as keyof InventoryItem;
    const order = urlParams.order as 'ascend' | 'descend';
    if (sort && order) {
      result.sort((a, b) => {
        if (sort === 'name') {
          return order === 'ascend'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sort === 'quantity') {
          return order === 'ascend'
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
        return 0;
      });
    }

    return result;
  }, [nameSearch, filteredCategories, urlParams.sort, urlParams.order]);

  const columns: ColumnsType<InventoryItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: getSortOrder('name'),
      filteredValue: nameSearch ? [nameSearch] : null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <div className="flex justify-between">
            <button
              onClick={() => confirm()}
              className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
            >
              Search
            </button>
            <button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              className="px-2 py-1 bg-gray-200 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const filterValue = value as string;
        return record.name.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      sortOrder: getSortOrder('quantity'),
    },
    {
      title: 'Expiration Date',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categoryFilters,
      filteredValue: filteredCategories.length ? filteredCategories : null,
      onFilter: (value, record) => {
        const filterValue = value as string;
        return record.category === filterValue;
      },
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<InventoryItem> | SorterResult<InventoryItem>[],
  ) => {
    const newParams: TableQueryParams = {};

    if (pagination.current) {
      newParams.page = pagination.current;
    }

    // Handle filters
    if (filters.category && filters.category.length) {
      newParams.category = filters.category as string[];
    }
    if (filters.name && filters.name.length) {
      newParams.q = filters.name[0] as string;
    }

    // Handle sorting
    const sortResult = Array.isArray(sorter) ? sorter[0] : sorter;
    if (sortResult.columnKey && sortResult.order) {
      newParams.sort = sortResult.columnKey as string;
      newParams.order = sortResult.order;
    }

    navigate({
      search: qs.stringify(newParams),
    });
  };

  const currentPage = parseInt(urlParams.page as string || '1');

  return (
    <Table
      columns={columns}
      dataSource={filteredAndSortedData}
      rowKey="id"
      onChange={handleTableChange}
      pagination={{
        pageSize: 10,
        current: currentPage,
      }}
    />
  );
};