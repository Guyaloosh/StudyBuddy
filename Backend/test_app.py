import pytest
from flask import Flask
from app import app as flask_app

# Use the pytest fixture to create a test client
@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_register(client):
    response = client.post('/register', json={
        'email': 'test_user@example.com',
        'password': 'password123',
        'dateOfBirth': '2000-01-01',
        'type': 'student',
        'receiveNews': True
    })
    print("Response status code:", response.status_code)  # Debugging line
    print("Response data:", response.get_json())  # Debugging line
    assert response.status_code == 200
    assert response.get_json()['message'] == "User registered successfully"

def test_login(client):
    response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == "Login Successful"
    assert 'access_token' in response.get_json()

def test_logout(client):
    response = client.post('/logout')
    assert response.status_code == 200
    assert response.get_json()['message'] == "Logged out successfully"

def test_add_event(client):
    login_response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'password123'
    })
    id_token = login_response.get_json()['access_token']
    
    response = client.post('/add_event', headers={
        'Authorization': f'Bearer {id_token}'
    }, json={
        'title': 'Test Event',
        'startTime': '2023-07-01T10:00:00Z',
        'duration': 60,
        'importance': 'High',
        'description': 'This is a test event'
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == "Event added successfully"

def test_get_events(client):
    login_response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'password123'
    })
    id_token = login_response.get_json()['access_token']
    
    response = client.get('/get_events', headers={
        'Authorization': f'Bearer {id_token}'
    })
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_remove_event(client):
    # Add an event to remove first
    login_response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'password123'
    })
    id_token = login_response.get_json()['access_token']
    
    add_event_response = client.post('/add_event', headers={
        'Authorization': f'Bearer {id_token}'
    }, json={
        'title': 'Event to Remove',
        'startTime': '2023-07-01T10:00:00Z',
        'duration': 60,
        'importance': 'Medium',
        'description': 'This event will be removed'
    })
    event_id = add_event_response.get_json().get('id')
    
    # Now remove the event
    response = client.delete(f'/remove_event/{event_id}', headers={
        'Authorization': f'Bearer {id_token}'
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == "Event removed successfully"

def test_update_event(client):
    # Add an event to update first
    login_response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'password123'
    })
    assert login_response.status_code == 200
    id_token = login_response.get_json().get('access_token')
    print("Login ID Token:", id_token)  # Debugging line

    add_event_response = client.post('/add_event', headers={
        'Authorization': f'Bearer {id_token}'
    }, json={
        'title': 'Event to Update',
        'startTime': '2023-07-01T10:00:00Z',
        'duration': 60,
        'importance': 'Low',
        'description': 'This event will be updated'
    })
    print("Add Event Response Data:", add_event_response.get_json())  # Debugging line
    assert add_event_response.status_code == 200
    event_id = add_event_response.get_json().get('id')
    print("Event ID:", event_id)  # Debugging line

    # Now update the event
    response = client.put(f'/update_event/{event_id}', headers={
        'Authorization': f'Bearer {id_token}'
    }, json={
        'title': 'Updated Event',
        'startTime': '2023-07-01T11:00:00Z',
        'duration': 90,
        'importance': 'High',
        'description': 'This event has been updated'
    })
    print("Update Event Response Data:", response.get_json())  # Debugging line
    assert response.status_code == 200
    assert response.get_json()['message'] == "Event updated successfully"
