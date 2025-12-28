# serializers are used to convert any native python data types (ex: lists, dict) into JSON/XML format that is understood by frontend.
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ""),
            last_name=validated_data.get('last_name', ""),
        )
        return user

    class Meta:
        model = get_user_model()
        fields = ['id', 'email','password', 'first_name', 'last_name']  
        extra_kwargs = {'password': {'write_only': True}}

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        user = authenticate(
            email=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("This user has been deactivated")

        # 🔥 Attach the user to validated_data
        attrs["user"] = user
        return attrs
