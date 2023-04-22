from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from .models import User, Transaction
import json
from django.urls import reverse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from functools import update_wrapper
from django.http import Http404
from django.views.decorators.cache import never_cache
import random
import requests
import datetime





# get all users


def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

@ensure_csrf_cookie
@login_required
def users(request):
    users = User.objects.all().exclude(username=request.user.username)
    if users:
        return JsonResponse([{
            "username": user.username,
            "iban": user.iban,
            "email": user.email,
            "country": user.country
        } for user in users], status=200,safe=False)
    else:
        return JsonResponse({"error": "no users"}, status=200)

# add to savings

@ensure_csrf_cookie
@login_required
def savings_add(request):
    user = User.objects.filter(id=request.user.id)
    if request.method == "POST" and request.user.is_authenticated:
        data = json.loads(request.body)
        amount = float(data.get("amount"))
        if  not amount or amount > user[0].balance or not isinstance(amount,float) or float(data.get('amount')) <= 0 or user[0].balance <= 0 or data.get('amount') is None:
            return JsonResponse({"error": "invalid amount"}, status=400)
        else:
            User.objects.filter(id=request.user.id).update(balance = user[0].balance - amount, savings = user[0].savings + amount)
            return JsonResponse({"msg": "successfully added to savings"}, status=200)
    else:
        return JsonResponse({"error": "not post"}, status=400)


# subtract from savings

@ensure_csrf_cookie
@login_required
def savings_remove(request):
    user = User.objects.filter(id=request.user.id)
    if request.method == "POST" and request.user.is_authenticated:
        data = json.loads(request.body)
        amount = float(data.get("amount"))
        if user[0].savings <= 0 or amount > user[0].savings or not amount or not isinstance(amount,float) or float(data.get('amount')) <= 0  or data.get('amount') is None:
            return JsonResponse({"error": "invalid amount"}, status=400)
        else:
            User.objects.filter(id=request.user.id).update(balance = user[0].balance + amount, savings = user[0].savings - amount)
            return JsonResponse({"msg": "successfully added to savings"}, status=200)
    else:
        return JsonResponse({"error": "not post"}, status=400)



# make transaction

@ensure_csrf_cookie
@login_required
def make_transaction(request):
    if request.method == "POST":
        data = json.loads(request.body)
        recipient = data.get('recipientName')
        iban_recipient = data.get('iban_recipient')
        amount = data.get('amount')
        description = data.get('description')

        # checking for errors
        if amount is None or not amount or float(amount) > request.user.balance or float(amount) <= 0 or amount == "" or request.user.balance <= 0:
            return JsonResponse({"error": "invalid amount"}, status=400)

        elif not request.user or request.user not in User.objects.all():
            return JsonResponse({"error": "user not logged in"}, status=400)

        elif request.user == recipient:
            return JsonResponse({"error": "can not send money to yourself!"}, status=400)

        elif not recipient or not User.objects.filter(username=recipient).exists():
            return JsonResponse({"error": "recipient does not exist"}, status=400)

        elif not request.user.iban or not User.objects.filter(iban=request.user.iban).exists():
            return JsonResponse({"error": "sender got no iban"}, status=400)

        elif not iban_recipient or  not  User.objects.filter(iban=iban_recipient):
            return JsonResponse({"error": "iban invalid"}, status=400)
            
        # elif HttpResponse(500):
        #     return JsonResponse({"error": "500 error!"}, status=500)
        else:
            transaction = Transaction.objects.create(user=request.user,sender=request.user, sender_iban=request.user.iban, recipient=User.objects.get(username=recipient), recipient_iban=iban_recipient ,timestamp=datetime.datetime.now().strftime("%d-%m-%Y %X"), amount=amount,description=description)
            transaction.save()
            send=User.objects.filter(id=request.user.id)
            send.update(balance = round(request.user.balance - amount,2))
            # get recipient
            rec=User.objects.get(iban=iban_recipient.strip())
            dek = User.objects.filter(id=rec.id).update(balance = round(rec.balance + amount,2))
            return JsonResponse({"msg": "transfer completed"}, status=200)
    else:
        return JsonResponse({"error": "not post"}, status=400)
            
       
        



# list of all transactions
@csrf_protect
@login_required

def transactions(request):
    transactions = []
    transactions_sent = Transaction.objects.filter(sender=request.user).order_by('-timestamp')

    for transaction_sent in transactions_sent:
        transactions.append(transaction_sent)
    
    transactions_received = Transaction.objects.filter(recipient=request.user).order_by('-timestamp')

    for transaction_received in transactions_received:
        transactions.append(transaction_received) 
    
    
   
    if transactions:
        return JsonResponse([
            {
            "amount": round(transaction.amount, 2),
            "recipient": transaction.recipient.username,
            "sender": transaction.sender.username,
            "send": True if transaction.sender == request.user else False,
            "sender_iban": transaction.sender_iban,
            "recipient_iban": transaction.recipient_iban,
            "timestamp": transaction.timestamp.strftime("%d %B")
        } for transaction in transactions], status=200,safe=False)
    else:
        return JsonResponse({"error": "no transactions"}, status=400)

# check if user is logged in (this is an example - 20/11/2022 23:00)
@login_required
def current_user(request):
    user = request.user
    if not request.user.is_anonymous and request.user.is_authenticated:
        return JsonResponse(user.serialize(),status=200)
    else:
        return JsonResponse({"error": "no user"},status=400)


# delete user

@login_required
@ensure_csrf_cookie
def delete_user(request,id):
    user = User.objects.get(id=request.user.id)
    if request.method == 'POST' and request.user.is_authenticated:
        user.delete()
        return JsonResponse({"msg": "user deleted!"}, status=200)
    else:
        return JsonResponse({"error": "can not delete user"})


# update user data

@login_required
@ensure_csrf_cookie
def update_user(request,id):
    if request.user and request.method == 'PUT':
        data = json.loads(request.body)
        user = User.objects.filter(id=request.user.id)
        username = data.get('username')
        adress = data.get('adress')
        email = data.get('email')
        

        if not username or not username.strip() or username.strip() == "" or len(username.strip()) < 4 or username is None:
            return JsonResponse({"error": "username too short"},status=400)

        elif not email or not email.strip() or email.strip() == "" or len(email.strip()) < 6:
            return JsonResponse({"error": "can not update email"}, status=400)
        
        elif not adress or not adress.strip() or adress.strip() == "" or  len(adress.strip()) < 4:
            return JsonResponse({"error": "can not update country"}, status=400)

        else:
            user.update(username=username.strip(),email=email.strip(),country=adress.strip())
            return JsonResponse({"msg": "update successfull!"}, status=200)
    else:
        return JsonResponse({"error": "not post or user not logged in"}, status=400)

        





@ensure_csrf_cookie
def login_view(request):
    if request.method == "POST":
         data = json.loads(request.body)
         # Attempt to sign user in
         username = data.get("username")
         password = data.get("password")
         user = authenticate(request, username=username, password=password)
         # Check if authentication successful
         if user is not None or user:
             login(request, user)
             return JsonResponse({"message": "User logged in!"}, status=200)
         else:
             return JsonResponse({"error": "Invalid username and/or password."}, status =400)
      
    else:
        return JsonResponse({"error": "not post request"},status=404)



@ensure_csrf_cookie
def logout_view(request):
    if request:
        logout(request)
        return JsonResponse({"message": "logged out!"}, status=200)
    else:
        return JsonResponse({"error": "Not logged in!"}, status=400)






@ensure_csrf_cookie
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        # Ensure password matches confirmation
        password = data.get("password")
        confirmation = data.get("confirmation")
        country = data.get("country")
        
    
        
        # check if fields are filled
        if not username or len(username) < 4 or not username.strip() or len(username.strip()) < 4:
            return JsonResponse({"error":"Username invalid! Should be at least 6 characters."}, status=400)
        
        elif not email  or len(email) < 12 or not email.strip() or len(email.strip()) < 12 or email.strip() in User.objects.all():
            return JsonResponse({"error":"Email invalid"}, status=400)
    
        elif not country:
            return JsonResponse({"error": "Please select country"}, status=400)

        elif password != confirmation:
           return JsonResponse({"error":"paswords do not match"}, status=400)

        elif not password or len(password) < 6 or not password.strip() or len(password.strip()) < 6:
            return JsonResponse({"error":"pasword too short"}, status=400)

        elif not confirmation and not password and not email and not username:
            return JsonResponse({"error": "fields are empty"})
        # Attempt to create new user
        else:
            if username in User.objects.all():
                return JsonResponse({"error": "user already exists"}, status=400)
            else:
                # generate iban
                url = f'https://restcountries.com/v3.1/name/{country}'
                response = requests.get(url)
                cca2 = response.json()[0]['cca2']

                def iban_gen():
                    iban = ''
                    if not country:
                        return JsonResponse({"error": "select country!"}, status=400)
                    iban += cca2
                    banks = ['ING','ABNA', 'RABO', 'AEXA', 'MEDI', 'BNMP']
                    f = random.randint(0,99)
                    iban += str(f)

                    if cca2 == "NL":
                        iban += str(random.choice(banks))

                    iban += str(random.randint(0,999999999))
                    return iban
                iban = iban_gen()


                user = User.objects.create_user(username, email, iban=iban, country=country, password=password)
                user.save()
                login(request, user)
                return JsonResponse({"message": "user created"}, status=200)
            # inmediately log user in
            
    else:
       return JsonResponse({"error": "not post"}, status=400)




