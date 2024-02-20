# syntax=docker/dockerfile:1
FROM ruby:3.1.0
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client && \
apt-get install -y build-essential libvips libpq-dev && \
apt-get clean && \
rm -rf /var/lib/apt/lists/* /user/share/doc /user/share/man

# Instalar o Node.js e o npm
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v 2.3.3 && \
    bundle install --binstubs

# Add a script to be executed every time the container starts.
#COPY entrypoint.sh /usr/bin/
#RUN chmod +x /usr/bin/entrypoint.sh
#ENTRYPOINT ["entrypoint.sh"]
COPY . .
EXPOSE 3000

RUN rm -rf /app/tmp/cache

# Configure the main process to run when running the image
CMD ["rails", "server", "-b", "0.0.0.0"]
