from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_KEY: str
    AZURE_EMBEDDING_DEPLOYMENT: str = "text-embedding-3-small"
    LLM_BASE_URL: str
    LLM_API_KEY: str
    LLM_MODEL: str = "Kimi-K2.5"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
