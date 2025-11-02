#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
书签解析器 - 解析Netscape书签文件并生成现代化的书签管理页面
严格按照原始HTML文件中的分类，不进行智能重新分类
"""

import re
import json
import html
from urllib.parse import urlparse
from typing import List, Dict, Any

class BookmarkParser:
    def __init__(self):
        self.bookmarks = []
        self.categories = {}
    
    def parse_bookmark_file(self, file_path: str) -> List[Dict[str, Any]]:
        """解析书签文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 使用正则表达式提取书签信息
            bookmark_pattern = r'<DT><A HREF="([^"]+)"[^>]*(?:ICON="([^"]*)")?[^>]*>([^<]+)</A>'
            category_pattern = r'<DT><H3[^>]*>([^<]+)</H3>'
            
            bookmarks = []
            current_category = "未分类"
            
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                
                # 检查是否是分类标题
                category_match = re.search(category_pattern, line)
                if category_match:
                    current_category = html.unescape(category_match.group(1))
                    continue
                
                # 检查是否是书签
                bookmark_match = re.search(bookmark_pattern, line)
                if bookmark_match:
                    url = bookmark_match.group(1)
                    icon = bookmark_match.group(2) or ""
                    title = html.unescape(bookmark_match.group(3))
                    
                    # 使用原始分类
                    smart_category = self.categorize_bookmark(url, title, current_category)
                    
                    bookmark = {
                        'url': url,
                        'title': title,
                        'icon': icon,
                        'original_category': current_category,
                        'smart_category': smart_category,
                        'domain': urlparse(url).netloc
                    }
                    bookmarks.append(bookmark)
            
            self.bookmarks = bookmarks
            return bookmarks
            
        except Exception as e:
            print(f"解析书签文件时出错: {e}")
            return []
    
    def categorize_bookmark(self, url: str, title: str, original_category: str = "") -> str:
        """直接使用原始分类，不进行智能重新分类"""
        # 直接返回原始分类，如果为空则返回"未分类"
        if original_category and original_category.strip():
            return original_category.strip()
        return "未分类"
    
    def generate_bookmark_data(self) -> Dict[str, Any]:
        """生成书签数据"""
        # 按分类组织书签
        categories = {}
        for bookmark in self.bookmarks:
            category = bookmark['smart_category']
            if category not in categories:
                categories[category] = []
            categories[category].append(bookmark)
        
        # 统计信息
        stats = {
            'total_bookmarks': len(self.bookmarks),
            'total_categories': len(categories),
            'categories': {cat: len(bookmarks) for cat, bookmarks in categories.items()}
        }
        
        return {
            'bookmarks': self.bookmarks,
            'categories': categories,
            'stats': stats
        }
    
    def save_json_data(self, output_path: str):
        """保存JSON数据"""
        data = self.generate_bookmark_data()
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"书签数据已保存到: {output_path}")
        except Exception as e:
            print(f"保存JSON数据时出错: {e}")

def main():
    parser = BookmarkParser()
    
    # 解析书签文件
    bookmark_file = "bookmarks_2025_11_2.html"
    bookmarks = parser.parse_bookmark_file(bookmark_file)
    
    if bookmarks:
        print(f"成功解析 {len(bookmarks)} 个书签")
        
        # 保存JSON数据
        parser.save_json_data("bookmarks_data.json")
        
        # 显示分类统计
        data = parser.generate_bookmark_data()
        print("\n分类统计:")
        for category, count in data['stats']['categories'].items():
            print(f"  {category}: {count} 个")
    else:
        print("未找到书签数据")

if __name__ == "__main__":
    main()