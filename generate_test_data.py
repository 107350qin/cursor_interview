import requests
import json
import random
import time

# API基础URL
BASE_URL = "http://localhost:8080/api"

# 登录信息
LOGIN_URL = f"{BASE_URL}/auth/login"
LOGIN_DATA = {
    "username": "admin",
    "password": "admin123"
}

# 分类名称列表
CATEGORIES = [
    "Java基础",
    "Spring框架",
    "Python编程",
    "数据库",
    "前端开发",
    "算法",
    "操作系统",
    "网络协议",
    "设计模式",
    "系统架构"
]

# 题目难度列表
DIFFICULTIES = ["EASY", "MEDIUM", "HARD"]

# 标签列表
TAGS = ["技术", "编程", "面试", "开发", "学习", "后端", "前端", "数据库", "算法", "框架"]

# 获取登录token
def get_token():
    response = requests.post(LOGIN_URL, json=LOGIN_DATA)
    if response.status_code == 200:
        return response.json()["data"]["token"]
    else:
        print("登录失败:", response.text)
        return None

# 创建分类
def create_category(token, name):
    url = f"{BASE_URL}/categories"
    headers = {"Authorization": f"Bearer {token}"}
    category_data = {"name": name}
    response = requests.post(url, json=category_data, headers=headers)
    if response.status_code == 200:
        return response.json()["data"]["id"]
    else:
        print(f"创建分类失败 {name}:", response.text)
        return None

# 创建题目
def create_question(token, title, content, difficulty, tags, analysis, category_id):
    url = f"{BASE_URL}/questions"
    headers = {"Authorization": f"Bearer {token}"}
    question_data = {
        "title": title,
        "content": content,
        "difficulty": difficulty,
        "tags": tags,
        "analysis": analysis,
        "categoryId": category_id
    }
    response = requests.post(url, json=question_data, headers=headers)
    if response.status_code == 200:
        return response.json()["data"]["id"]
    else:
        print(f"创建题目失败 {title}:", response.text)
        return None

# 生成随机标签
def generate_tags():
    tag_count = random.randint(1, 3)
    selected_tags = random.sample(TAGS, tag_count)
    return ",".join(selected_tags)

# 生成题目内容
def generate_question_content(category, index):
    return f"这是{category}分类下的第{index}道题目，考察相关知识点。请详细回答这个问题。"

# 生成题目解析
def generate_question_analysis(category):
    return f"这道{category}分类的题目主要考察相关知识点，正确答案是XXX，需要注意XXX等关键点。"

# 主函数
def main():
    # 获取token
    token = get_token()
    if not token:
        return
    
    # 创建分类
    category_ids = []
    for category in CATEGORIES:
        category_id = create_category(token, category)
        if category_id:
            category_ids.append(category_id)
            print(f"创建分类成功: {category} (ID: {category_id})")
        time.sleep(0.1)  # 避免请求过快
    
    # 生成题目数据
    question_count = 100
    questions_per_category = question_count // len(category_ids)
    
    for i, category_id in enumerate(category_ids):
        category_name = CATEGORIES[i]
        for j in range(questions_per_category):
            title = f"{category_name}面试题_{i+1}_{j+1}"
            content = generate_question_content(category_name, j+1)
            difficulty = random.choice(DIFFICULTIES)
            tags = generate_tags()
            analysis = generate_question_analysis(category_name)
            
            question_id = create_question(token, title, content, difficulty, tags, analysis, category_id)
            if question_id:
                print(f"创建题目成功: {title} (ID: {question_id})")
            time.sleep(0.1)  # 避免请求过快

if __name__ == "__main__":
    main()
