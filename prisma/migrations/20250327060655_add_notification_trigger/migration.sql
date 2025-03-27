-- 알림이 추가될 때 `pg_notify`를 실행하는 함수 생성
CREATE OR REPLACE FUNCTION notify_new_notification() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_notification', json_build_object(
    'id', NEW.id,
    'userId', NEW.user_id,
    'message', NEW.message,
    'highlight', NEW.highlight,
    'isRead', NEW.is_read,
    'url', NEW.url,
    'createdAt', NEW.created_at
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--트리거 추가: `notification` 테이블에 INSERT될 때 실행
CREATE TRIGGER new_notification_trigger
AFTER INSERT ON "notification"
FOR EACH ROW EXECUTE FUNCTION notify_new_notification();