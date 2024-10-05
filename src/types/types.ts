// src/types/types.ts
export interface Topic {
    string_map_data: {
      Name: {
        value: string;
      };
    };
  }
  
  export interface TopicData {
    topics_your_topics: Topic[];
  }

  export interface Word {
    text: string;
    value: number;
  }
  export interface SearchKeyword {
    string_map_data: {
      Search: {
        value: string;
        timestamp: number;
      };
      Time: {
        timestamp: number;
      };
    };
  }
  
  export interface SearchData {
    searches_keyword: SearchKeyword[];
  }

  export interface GraphData {
    nodes: { id: string }[];
    links: { source: string; target: string }[];
  }
  