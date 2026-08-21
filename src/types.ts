export interface PhDPosition {
  id: string;
  title: string;
  institution: string;
  country: string;
  city?: string;
  supervisor?: string | null;
  description: string;
  funding_status: string;
  url: string;
  matched_topic: "Federated Learning" | "Human Activity Recognition" | "Transformers & Deep Learning" | string;
  matched_keyword: string;
  source_platform: string;
  deadline?: string;
  discovered_date: string;
}

export interface ScraperConfig {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  smtpSenderEmail: string;
  smtpPassword: string;
  emailRecipient: string;
  scheduleTime: string;
  minDelay: number;
  maxDelay: number;
  runOnStartup: boolean;
}

export interface CrawlerLog {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "FILTER";
  message: string;
  details?: string;
}
