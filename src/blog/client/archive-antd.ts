import {
  Button,
  Calendar,
  type CalendarProps as BaseCalendarProps,
  Card,
  ConfigProvider,
  Flex,
  FloatButton,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import {
  LeftOutlined,
  ReadOutlined,
  RightOutlined,
  ScheduleOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";

const { Paragraph, Title } = Typography;
const BackTop = FloatButton.BackTop;

export type CalendarProps<DateType> = BaseCalendarProps<DateType>;

export {
  BackTop,
  Button,
  Calendar,
  Card,
  ConfigProvider,
  Flex,
  LeftOutlined,
  Paragraph,
  ReadOutlined,
  RightOutlined,
  ScheduleOutlined,
  Tag,
  Timeline,
  Title,
  Tooltip,
  VerticalAlignTopOutlined,
};
