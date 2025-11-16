#!/bin/bash

set -a  # ⭐ .env 파일에 있는 모든 변수 자동 export
source /home/ec2-user/emoforge/cleanup-service/.env.prod
set +a  # 자동 export 종료

BASE_DIR="/home/ec2-user/emoforge/cleanup-service"
JAR_NAME="build/libs/cleanup-service-1.0-SNAPSHOT.jar"
LOG_FILE="$BASE_DIR/cleanup.log"

cd $BASE_DIR

echo "====================================" >> $LOG_FILE
echo "🚀 Cleanup Start: $(date '+%Y-%m-%d %H:%M:%S')" >> $LOG_FILE

JAVA_CMD="java \
 -Dspring.profiles.active=prod \
 -Dspring.config.additional-location=classpath:/application-prod.yml \
 -jar $JAR_NAME"

OPTION=$1

if [ "$OPTION" == "profile" ]; then
    $JAVA_CMD --profile >> $LOG_FILE 2>&1
elif [ "$OPTION" == "editor" ]; then
    $JAVA_CMD --editor >> $LOG_FILE 2>&1
elif [ "$OPTION" == "all" ]; then
    $JAVA_CMD --profile --editor >> $LOG_FILE 2>&1
else
    echo "❌ 사용법: ./cleanup.sh {profile|editor|all}" | tee -a $LOG_FILE
    exit 1
fi

echo "✨ Cleanup Done: $(date '+%Y-%m-%d %H:%M:%S')" >> $LOG_FILE
echo "====================================" >> $LOG_FILE
echo "" >> $LOG_FILE
