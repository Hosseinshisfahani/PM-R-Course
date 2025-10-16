#!/bin/bash

# Start Django backend server
echo "Starting Django backend server..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install requirements if needed
if [ -f "requirements/requirements.txt" ]; then
    echo "Installing requirements..."
    pip install -r requirements/requirements.txt
fi

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser (if needed)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(user_type='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        user_type='admin'
    )
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Start the server
echo "Starting Django development server on http://localhost:8000"
python manage.py runserver 8000
