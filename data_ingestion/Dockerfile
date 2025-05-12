FROM pgvector/pgvector:pg17

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=cdc
ENV POSTGRES_HOST_AUTH_METHOD=trust

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3-dev \
    python3-pip \
    dos2unix

COPY requirements.txt /app/
RUN pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt

COPY src/ /app/src/
COPY CDC.pdf /app/

# Set the working directory
WORKDIR /app/
RUN chmod -R a+w /app
COPY init.sh /docker-entrypoint-initdb.d/init.sh
# RUN chmod +x /docker-entrypoint-initdb.d/init.sh
RUN dos2unix /docker-entrypoint-initdb.d/init.sh && chmod +x /docker-entrypoint-initdb.d/init.sh
# Start PostgreSQL
# CMD ["/app/init.sh"]