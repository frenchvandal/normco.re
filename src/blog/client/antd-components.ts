import {
  Breadcrumb,
  Button,
  Calendar,
  type CalendarProps as BaseCalendarProps,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Flex,
  FloatButton,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";

const { Paragraph, Title } = Typography;
const BackTop = FloatButton.BackTop;

export type CalendarProps<DateType> = BaseCalendarProps<DateType>;

export {
  BackTop,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Paragraph,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Title,
  Tooltip,
};
