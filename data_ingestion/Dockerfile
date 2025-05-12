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

# Copy the entrypoint script
COPY init.sh /app/
# RUN chmod +x /app/init.sh
RUN dos2unix /app/init.sh && chmod +x /app/init.sh && ls -l /app/init.sh


# Start PostgreSQL
CMD ["/app/init.sh"]